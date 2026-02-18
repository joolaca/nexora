// backend/src/clans/overview/clan-overview.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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

}
