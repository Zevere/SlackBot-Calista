import Winston from '../../logging/app.logger';
import mongoose from 'mongoose';
import { User } from '../../data/schema/user';


export async function linkAccounts(zevereId: string, slackId: string) {
    const user = new User();
    user.zevereId = zevereId;
    user.slackId = slackId;

    if (await userExists(user)) {
        Winston.info('Account already exists');
        return false;
    }

    const UserModel = mongoose.model('User');
    Winston.info('Linking accounts:');
    Winston.info(`\tZevere ID: ${zevereId}`);
    Winston.info(`\tSlack ID: ${slackId}`);

    await UserModel.create(user);
    return true;
}


async function findFirstUser(user: User) {  // eslint-disable-line no-unused-vars
    const UserModel = mongoose.model('User');
    let result = await UserModel.find(user);
    if (result.length <= 0) {
        return null;
    }
    return result[0];
}

async function userExists(user: User) {
    const UserModel = mongoose.model('User');
    await UserModel.find().or([{ slackId: user.slackId }, { zevereId: user.zevereId }]);
}