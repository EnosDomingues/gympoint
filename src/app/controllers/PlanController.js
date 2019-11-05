import * as Yup from 'yup';
import Plan from '../models/Plan';
import User from '../models/User';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .required()
        .max(6),
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

    const { id, title, duration, price } = await Plan.create(req.body);
    return res.json({
      id,
      title,
      duration,
      price,
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

    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
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

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    /**
     * check if the logged user is an admin
     */
    const checkIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });

    if (!checkIsAdmin) {
      return res.status(400).json({ error: 'You dont have permission' });
    }

    const plan = await Plan.findByPk(req.params.id);

    const { title, duration, price } = plan;

    plan.destroy();

    return res.json({ title, duration, price });
  }
}

export default new PlanController();
