//backend/src/clans/requests/clan-requests.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    ClanRequest,
    ClanRequestDocument,
    ClanRequestStatus,
    ClanRequestType,
} from "./clan-request.schema";


@Injectable()
export class ClanRequestRepository {
    constructor(
        @InjectModel(ClanRequest.name)
        private readonly reqModel: Model<ClanRequestDocument>
    ) {}

    findById(id: string) {
        return this.reqModel.findById(id).exec();
    }

    async findPending(clanId: string, userId: string) {
        return this.reqModel.findOne({
            clanId: new Types.ObjectId(clanId),
            userId: new Types.ObjectId(userId),
            status: "PENDING",
        }).exec();
    }

    async createPending(params: {
        clanId: string;
        userId: string;
        type: ClanRequestType;
        createdByUserId: string;
        session?: any;
    }) {
        const doc = await this.reqModel.create(
            [
                {
                    clanId: new Types.ObjectId(params.clanId),
                    userId: new Types.ObjectId(params.userId),
                    type: params.type,
                    status: "PENDING",
                    createdByUserId: new Types.ObjectId(params.createdByUserId),
                    decidedByUserId: null,
                    decidedAt: null,
                },
            ],
            { session: params.session }
        );

        return doc[0];
    }

    async updateStatus(params: {
        id: Types.ObjectId;
        status: ClanRequestStatus;
        decidedByUserId: string;
        session?: any;
    }) {
        await this.reqModel.updateOne(
            { _id: params.id },
            {
                $set: {
                    status: params.status,
                    decidedByUserId: new Types.ObjectId(params.decidedByUserId),
                    decidedAt: new Date(),
                },
            },
            { session: params.session }
        );
    }

    async listForUser(userId: string) {
        return this.reqModel
            .find({ userId: new Types.ObjectId(userId) }, { clanId: 1, userId: 1, type: 1, status: 1, createdAt: 1, updatedAt: 1 })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async listPendingForClan(clanId: string) {
        return this.reqModel
            .find({ clanId: new Types.ObjectId(clanId), status: "PENDING" }, { clanId: 1, userId: 1, type: 1, status: 1, createdAt: 1 })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }


    async listPendingInvitesForClan(clanId: string) {
        const clanObjectId = new Types.ObjectId(clanId);

        const rows = await this.reqModel
            .aggregate([
                {
                    $match: {
                        clanId: clanObjectId,
                        type: "INVITE",
                        status: "PENDING",
                    },
                },
                { $sort: { createdAt: -1 } },

                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

                {
                    $project: {
                        _id: 1,
                        clanId: 1,
                        userId: 1,
                        type: 1,
                        status: 1,
                        createdByUserId: 1,
                        createdAt: 1,

                        // plusz mező:
                        username: "$user.username",
                    },
                },
            ])
            .exec();

        return rows.map((r: any) => ({
            requestId: String(r._id),
            clanId: String(r.clanId),
            userId: String(r.userId),
            type: r.type,
            status: r.status,
            createdByUserId: String(r.createdByUserId),
            createdAt: r.createdAt,
            username: r.username ?? null,
        }));
    }

}
