const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.info('successfully get fragment data by id');
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (error) {
    logger.error({ error }, 'error getting fragment info by id');
    res.status(404).json(createErrorResponse(404, error));
  }
};
