// backend/src/clans/management/clan-management.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { Clan, ClanDocument, ClanRole } from "../core/clans.schema";

export type CreateClanDbParams = {
    name: string;
    slug: string;
    ownerUserId: string;
    roles: ClanRole[];
};

@Injectable()
export class ClanManagementRepository {
    constructor(
        @InjectModel(Clan.name)
        private readonly clanModel: Model<ClanDocument>,
    ) {}

    async existsBySlug(slug: string, excludeClanId?: string, session?: ClientSession) {
        const filter: any = { slug };

        if (excludeClanId) {
            filter._id = { $ne: new Types.ObjectId(excludeClanId) };
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
            session ? { session } : undefined,
        );

        return created;
    }

    async findById(clanId: string, session?: ClientSession) {
        const q = this.clanModel.findById(new Types.ObjectId(clanId));

        if (session) {
            q.session(session);
        }

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

    async deleteById(clanId: string, session?: ClientSession) {
        const q = this.clanModel.deleteOne({
            _id: new Types.ObjectId(clanId),
        });

        if (session) {
            q.session(session);
        }

        return q.exec();
    }
}