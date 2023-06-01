const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported type'));
  }

  try {
    const id = req.params.id;
    const targetFragment = await Fragment.byId(req.user, id);

    // if (!targetFragment) {
    //   return res.status(404).json(createErrorResponse(404, 'No fragment with this id'));
    // }

    if (targetFragment.type !== req.get('Content-Type')) {
      logger.error('content type is not matching');
      return res
        .status(400)
        .json(
          createErrorResponse(400, "Content type doesn't match with the target fragment's type")
        );
    }

    const updatedFragment = new Fragment({
      ownerId: req.user,
      id: id,
      created: targetFragment.created,
      type: req.get('Content-Type'),
      size: req.body.length,
    });

    await updatedFragment.save();
    await updatedFragment.setData(req.body);

    logger.info({ updatedFragment }, 'Fragment updated');

    //res.set('Content-Type', updatedFragment.type);
    res.location(`${process.env.API_URL}/v1/fragments/${id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: updatedFragment,
      })
    );
  } catch (error) {
    logger.error({ error }, 'error updating a existing fragment');
    res.status(404).json(createErrorResponse(404, error));
  }
};
