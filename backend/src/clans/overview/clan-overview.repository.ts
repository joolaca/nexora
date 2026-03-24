import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {ClientSession, Model, Types} from "mongoose";
import {Clan, ClanDocument} from "../core/clans.schema";
import {CreateClanDbParams} from "./clan-overview.types";

@Injectable()
export class ClansOverviewRepository {
    constructor(
        @InjectModel(Clan.name)
        private readonly clanModel: Model<ClanDocument>
    ) {
    }

    async findByIds(ids: string[]) {
        if (!ids.length) return [];

        return this.clanModel
            .find(
                {_id: {$in: ids.map((id) => new Types.ObjectId(id))}},
                {name: 1, slug: 1}
            )
            .lean()
            .exec();
    }

    async existsBySlug(slug: string, excludeClanId?: string, session?: ClientSession) {
        const filter: any = {slug};

        if (excludeClanId) {
            filter._id = {$ne: new Types.ObjectId(excludeClanId)};
        }

        const q = this.clanModel.exists(filter);

        if (session) {
            q.session(session);
        }

        return q;
    }

    async createClan(params: CreateClanDbParams, session?: ClientSession) {
        const [created] = await this.clanModel.create(
            [
                {
                    name: params.name,
                    slug: params.slug,
                    roles: params.roles,
                    members: [
                        {
                            userId: new Types.ObjectId(params.ownerUserId),
                            roleKey: "owner",
                        },
                    ],
                },
            ],
            session ? {session} : undefined,
        );

        return created;
    }

}
