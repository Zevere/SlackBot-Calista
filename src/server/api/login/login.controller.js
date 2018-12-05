import { loginPrompt, messageUserEphemeral } from '../../../slack/messaging';
import { NextFunction, Request, Response } from 'express';
import Winston from '../../../logging/app.logger';
import { prettyJson } from '../../../logging/format';
import { SlackClient } from '../../../slack';
import { userIsRegistered } from '../../authorization/authorization.service';


export async function promptLogin(req: Request, res: Response, next: NextFunction) {
    const client = new SlackClient();
    try {
        res.status(200).send('Got it!'); // basic receipt: https://api.slack.com/slash-commands?#responding_basic_receipt
        req.body |> prettyJson |> Winston.info;
        const {
            user_id,
            channel_id
        } = req.body; 
        if(await userIsRegistered(user_id)) {
            return await messageUserEphemeral(client, user_id, channel_id, 'You are already logged in.');
        }

        const url = `https://${req.get('host')}`;
        await loginPrompt(client, user_id, channel_id, url);
    }
    catch (exception) {
        Winston.error('Exception in promptLogin');
        exception |> prettyJson |> Winston.error;
        next(exception);
    }
}
