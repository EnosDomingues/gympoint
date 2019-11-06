import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import Plan from '../models/Plan';

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

    const { duration, price } = await Plan.findByPk(plan_id);

    req.body.end_date = addMonths(parseISO(start_date), duration);
    req.body.price = price * duration;

    const {
      id,
      student_id,
      end_date,
      price: fullPrice,
    } = await Enrollment.create(req.body);

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
