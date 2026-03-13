// backend/src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./users.schema";


function generateAboutText(i: number) {
    const randomText = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. ",
        "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
        "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
        "Sed id nunc felis. Aliquam tellus enim, semper ut tellus a, elementum euismod risus. Aenean molestie facilisis luctus. Phasellus molestie quam non mi finibus, eu sollicitudin augue mollis.",
        "Suspendisse quis pellentesque elit, at ultrices tellus. In tincidunt, erat id luctus imperdiet, sapien ex egestas turpis, at finibus velit arcu eget nulla. ",
    ];


    return randomText[Math.floor(Math.random() * randomText.length)];
}


@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    findByUsername(username: string) {
        return this.userModel.findOne({ username: username.toLowerCase() }).exec();
    }

    async findById(userId: string, session?: any) {
        const q = this.userModel.findById(userId);
        if (session) q.session(session);
        return q.exec();
    }

    existsByUsername(username: string, excludeUserId?: string) {
        const u = username.toLowerCase();
        const filter: any = { username: u };
        if (excludeUserId) filter._id = { $ne: excludeUserId };
        return this.userModel.exists(filter);
    }

    async createUser(params: { username: string; passwordHash: string; rank?: number }) {
        return await this.userModel.create({
            username: params.username.toLowerCase(),
            password: params.passwordHash,
            rank: params.rank ?? 0,
        });

    }

    async save(doc: UserDocument) {
        return doc.save();
    }

    async bulkUpsertSeedUsers(params: { count: number; passwordHash: string }) {
        const ops = [];

        for (let i = 1; i <= params.count; i++) {
            const rankRandom = Math.floor(Math.random() * 1000);
            const username = `user${i}`;
            const about = generateAboutText(i);

            ops.push({
                updateOne: {
                    filter: { username },
                    update: {
                        $setOnInsert: {
                            username,
                            password: params.passwordHash,
                            rank: rankRandom,
                            about,
                        },
                    },
                    upsert: true,
                },
            });
        }

        return this.userModel.bulkWrite(ops, { ordered: false });
    }
}
