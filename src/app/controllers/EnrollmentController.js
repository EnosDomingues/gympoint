import * as Yup from 'yup';
import { addMonths, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import Plan from '../models/Plan';
import Mail from '../../lib/Mail';
import Student from '../models/Student';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    /**
     * check if the logged user is an admin
     */
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });

    if (!checkIsAdmin) {
      return res.status(400).json({ error: 'You dont have permission' });
    }

    const { plan_id, start_date } = req.body;

    const { duration, price, title } = await Plan.findByPk(plan_id);

    const fPrice = price * duration;

    const endDate = addMonths(parseISO(start_date), duration);

    req.body.end_date = endDate;

    req.body.price = fPrice;

    const {
      id,
      student_id,
      end_date,
      price: fullPrice,
    } = await Enrollment.create(req.body);

    const { name, email } = await Student.findByPk(student_id);

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Matrícula GymPoint',
      template: 'enrollment',
      context: {
        user: name,
        plan: title,
        duration,
        price: fPrice,
        startDate: format(parseISO(start_date), "'dia' dd 'de' MMM yyyy'", {
          locale: pt,
        }),
        endDate: format(endDate, "'dia' dd 'de' MMM yyyy'", {
          locale: pt,
        }),
      },
    });

    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      fullPrice,
    });
  }

  async index(req, res) {
    /**
     * check if the logged user is an admin
     */
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });

    if (!checkIsAdmin) {
      return res.status(400).json({ error: 'You dont have permission' });
    }

    const enrollments = await Enrollment.findAll({
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
    });

    return res.json(enrollments);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      pland_id: Yup.number().required(),
      start_date: Yup.date().required(),
      end_date: Yup.date().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    /**
     * check if the logged user is an admin
     */
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });

    if (!checkIsAdmin) {
      return res.status(400).json({ error: 'You dont have permission' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    const {
      id,
      student_id,
      pland_id,
      start_date,
      end_date,
      price,
    } = await enrollment.update(req.body);

    return res.json({ id, student_id, pland_id, start_date, end_date, price });
  }
}

export default new EnrollmentController();
