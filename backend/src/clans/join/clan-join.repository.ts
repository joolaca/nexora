// backend/src/clans/join/clan-join.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    ClanJoinRequest,
    ClanJoinRequestDocument,
    ClanJoinRequestStatus,
    ClanJoinRequestType,
} from "./clan-join-request.schema";

@Injectable()
export class ClanJoinRepository {
    constructor(
        @InjectModel(ClanJoinRequest.name)
        private readonly reqModel: Model<ClanJoinRequestDocument>
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
        type: ClanJoinRequestType;
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
        status: ClanJoinRequestStatus;
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
            .find(
                { userId: new Types.ObjectId(userId) },
                { clanId: 1, userId: 1, type: 1, status: 1, createdAt: 1, updatedAt: 1 }
            )
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async listPendingForClan(clanId: string) {
        return this.reqModel
            .find(
                { clanId: new Types.ObjectId(clanId), status: "PENDING" },
                { clanId: 1, userId: 1, type: 1, status: 1, createdAt: 1 }
            )
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
}
