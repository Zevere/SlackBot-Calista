import { NextFunction, Request, Response } from 'express';
import Winston from '../../../logging/app.logger';
import { prettyJson } from '../../../logging/format';
import { SlackClient } from '../../../slack';
import { Client as BorzooClient } from '../../../borzoo/client';
import { getUserBySlackId } from '../../authorization/authorization.service';
import { messageUser } from '../../../slack/messaging';

/**
 * This endpoint is used by Slack when using interactive components.
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
export async function handleInteractiveRequest(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(200).send();
        const slack = new SlackClient();
        const bz = new BorzooClient();
        req.body |> prettyJson |> Winston.debug;
        const {
            callback_id,
            user: {
                id
            },
            submission // comes from the Slack form
        } = JSON.parse(req.body.payload);

        const user = await getUserBySlackId(id);

        switch (callback_id) {
            case 'createlist': {
                Winston.debug(`Creating list ${submission.title} for ${user.zevereId} / ${user.slackId}.`);
                const createdList = await bz.createList(user.zevereId, {
                    id: submission.title,
                    ...submission
                });
                Winston.debug('List created.');
                createdList |> prettyJson |> Winston.debug;
                await messageUser(slack, id, `Your task list, "${submission.title}" has been created!`);
                break;
            }
            case 'createtask': {
                Winston.debug(`Creating task ${submission.title} for ${user.zevereId} / ${user.slackId}.`);
                const createdTask = await bz.addTask(user.zevereId, submission.tasklist,)
                Winston.debug('List created.');
                createdTask |> prettyJson |> Winston.debug;
                await messageUser(slack, id, `Your task list, "${submission.title}" has been created!`);
                break;
            }
            case 'viewtask':
            case 'viewlist':
            default:
                break;
        }
    } catch (exception) {
        exception |> prettyJson |> Winston.error;
        next(exception);
    }
}