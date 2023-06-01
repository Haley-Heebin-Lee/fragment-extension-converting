// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // TODO: this is just a placeholder to get something working...
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported type'));
  }

  try {
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
      size: req.body.length,
    });
    await fragment.save();
    await fragment.setData(req.body);

    logger.info({ fragment }, 'new fragment is created');

    res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (error) {
    logger.error({ error }, 'error writing a new fragment');
    res.status(500).json(createErrorResponse(500, error));
  }
};
