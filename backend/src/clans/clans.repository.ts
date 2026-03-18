// backend/src/clans/overview/clan-overview.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { Clan, ClanDocument } from "./core/clans.schema";

@Injectable()
export class ClansRepository {
    constructor(
        @InjectModel(Clan.name)
        private readonly clanModel: Model<ClanDocument>
    ) {}



    async findById(clanId: string, session?: any) {
        const q = this.clanModel.findById(clanId);
        if (session) q.session(session);
        return q.exec();
    }

    async findByMemberUserId(userId: string, session?: ClientSession) {
        const q = this.clanModel.findOne({
            "members.userId": new Types.ObjectId(userId),
        });

        if (session) {
            q.session(session);
        }

        return q.exec();
    }

    async save(clan: ClanDocument, session?: ClientSession) {
        return clan.save(session ? { session } : undefined);
    }

}
