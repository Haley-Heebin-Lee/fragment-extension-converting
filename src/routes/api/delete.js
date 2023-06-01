const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const id = req.params.id;
  try {
    await Fragment.byId(req.user, id);
    await Fragment.delete(req.user, id);

    logger.info(`successfully deleted fragment: ${req.params.id}`);
    res.status(200).json(createSuccessResponse());
  } catch (e) {
    logger.error(`${req.params.id} not found`);
    res.status(404).json(createErrorResponse(404, e.message));
  }
};
