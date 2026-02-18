// backend/src/clans/overview/clan-overview.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Clan, ClanDocument } from "../core/clans.schema";

@Injectable()
export class ClansRepository {
    constructor(
        @InjectModel(Clan.name)
        private readonly clanModel: Model<ClanDocument>
    ) {}

    async findByIds(ids: string[]) {
        if (!ids.length) return [];

        return this.clanModel
            .find(
                { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } },
                { name: 1, slug: 1 }
            )
            .lean()
            .exec();
    }

    async findById(clanId: string) {
        return this.clanModel.findById(clanId).exec();
    }

}
