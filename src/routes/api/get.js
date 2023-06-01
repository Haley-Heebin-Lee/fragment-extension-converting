// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  // TODO: this is just a placeholder to get something working...
  try {
    const fragment = await Fragment.byUser(req.user, req.query.expand);

    logger.info(`successfully got fragment list`);
    res.status(200).json(
      createSuccessResponse({
        fragments: fragment,
      })
    );
  } catch (error) {
    logger.error({ error }, 'error getting fragment from api');
    res.status(500).json(createErrorResponse(500, error));
  }
};
