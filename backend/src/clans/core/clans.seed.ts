// backend/src/clans/clans.seed.ts
import { Model, Types } from "mongoose";
import { ClanDocument } from "./clans.schema";
import { BaseRoles } from "../roles/clan-roles.constants";
import { UserDocument } from "../../users/user.schema";

type RoleKey = "owner" | "admin" | "member";

function randomNonOwnerRole(): Exclude<RoleKey, "owner"> {
    return Math.random() < 0.35 ? "admin" : "member";
}

function range(from: number, to: number): number[] {
    const out: number[] = [];
    for (let i = from; i <= to; i++) out.push(i);
    return out;
}

export async function seedClans(params: {
    clanModel: Model<ClanDocument>;
}) {
    const { clanModel } = params;

    const defs = [
        { name: "Clan 1", slug: "clan-1" },
        { name: "Clan 2", slug: "clan-2" },
        { name: "Clan 3", slug: "clan-3" },
    ] as const;

    for (const d of defs) {
        await clanModel.updateOne(
            { slug: d.slug },
            {
                $setOnInsert: { name: d.name, slug: d.slug },
                $set: { roles: BaseRoles },
            },
            { upsert: true }
        );
    }

    const clans = await clanModel.find({ slug: { $in: defs.map((d) => d.slug) } }).exec();
    const bySlug = new Map(clans.map((c) => [c.slug, c]));

    return {
        clan1: bySlug.get("clan-1")!,
        clan2: bySlug.get("clan-2")!,
        clan3: bySlug.get("clan-3")!,
    };
}

export async function assignUsersToClans(params: {
    clanModel: Model<ClanDocument>;
    userModel: Model<UserDocument>;
    clanIds: { clan1Id: Types.ObjectId; clan2Id: Types.ObjectId; clan3Id: Types.ObjectId };
}) {
    const { clanModel, userModel, clanIds } = params;

    const usernames = range(1, 15).map((i) => `user${i}`);
    const users = await userModel
        .find({ username: { $in: usernames } }, { _id: 1, username: 1 })
        .lean()
        .exec();

    const idByUsername = new Map<string, Types.ObjectId>();
    for (const u of users) idByUsername.set(String(u.username), new Types.ObjectId(String(u._id)));

    const getUserId = (n: number) => {
        const id = idByUsername.get(`user${n}`);
        if (!id) throw new Error(`Clan assign: missing user${n}. (Előbb user seed!)`);
        return id;
    };

    const groups = [
        { clanId: clanIds.clan1Id, users: range(1, 5), owner: 1 },
        { clanId: clanIds.clan2Id, users: range(6, 10), owner: 6 },
        { clanId: clanIds.clan3Id, users: range(11, 15), owner: 11 },
    ] as const;

    await userModel.updateMany(
        { username: { $in: usernames } },
        { $set: { clanId: null } }
    );

    const allUserIds = groups.flatMap((g) => g.users.map((n) => getUserId(n)));
    await clanModel.updateMany(
        { "members.userId": { $in: allUserIds } },
        { $pull: { members: { userId: { $in: allUserIds } } } }
    );

    for (const g of groups) {
        const userIds = g.users.map((n) => getUserId(n));

        await userModel.updateMany(
            { _id: { $in: userIds } },
            { $set: { clanId: g.clanId } }
        );

        const members = g.users.map((n) => ({
            userId: getUserId(n),
            roleKey: n === g.owner ? ("owner" as RoleKey) : randomNonOwnerRole(),
            joinedAt: new Date(),
        }));

        await clanModel.updateOne(
            { _id: g.clanId },
            { $push: { members: { $each: members } } }
        );
    }

    return {
        assigned: groups.map((g) => ({
            clanId: String(g.clanId),
            users: g.users.length,
            owner: `user${g.owner}`,
        })),
    };
}
