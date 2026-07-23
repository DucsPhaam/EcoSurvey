const { FAQ } = require('../models');

// GET /api/faqs/public — no auth required
exports.getPublicFAQs = async (_req, res) => {
  try {
    const faqs = await FAQ.findAll({
      where: { is_active: true },
      attributes: ['id', 'question', 'answer', 'category'],
      order: [['created_at', 'ASC']],
    });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch FAQs.' });
  }
};
