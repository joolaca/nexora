// backend/src/clans/clans.seed.ts
import { Model, Types } from "mongoose";
import { ClanDocument } from "./clan.schema";
import { BaseRoles } from "./clans.roles.constants";
import { UserDocument } from "../users/user.schema";

type RoleKey = "owner" | "admin" | "member";

function randomNonOwnerRole(): Exclude<RoleKey, "owner"> {
    return Math.random() < 0.35 ? "admin" : "member";
}

function range(from: number, to: number): number[] {
    const out: number[] = [];
    for (let i = from; i <= to; i++) out.push(i);
    return out;
}

export async function seedClansWithMembers(params: {
    clanModel: Model<ClanDocument>;
    userModel: Model<UserDocument>;
}) {
    const { clanModel, userModel } = params;

    const usernames = range(1, 15).map((i) => `user${i}`);
    const users = await userModel
        .find({ username: { $in: usernames } }, { _id: 1, username: 1 })
        .lean()
        .exec();

    const idByUsername = new Map<string, Types.ObjectId>();
    for (const u of users) idByUsername.set(String(u.username), new Types.ObjectId(String(u._id)));

    const getUserId = (n: number) => {
        const key = `user${n}`;
        const id = idByUsername.get(key);
        if (!id) throw new Error(`Clan seed: missing user in DB: ${key}. (Futtasd le előtte a user seedet.)`);
        return id;
    };

    const defs = [
        { name: "Clan 1", slug: "clan-1", memberRange: range(1, 5), ownerUserNumber: 1 },
        { name: "Clan 2", slug: "clan-2", memberRange: range(6, 10), ownerUserNumber: 6 },
        { name: "Clan 3", slug: "clan-3", memberRange: range(11, 15), ownerUserNumber: 11 },
    ] as const;

    const results: any[] = [];

    for (const def of defs) {
        const ownerId = getUserId(def.ownerUserNumber);

        // Tagok listája (owner + többiek random admin/member)
        const members = def.memberRange.map((n) => {
            const userId = getUserId(n);
            const roleKey: RoleKey =
                n === def.ownerUserNumber ? "owner" : randomNonOwnerRole();

            return { userId, roleKey, joinedAt: new Date() };
        });

        const userIdsToReset = members.map((m) => m.userId);

        await clanModel.updateOne(
            { slug: def.slug },
            {
                $setOnInsert: { name: def.name, slug: def.slug },
                $set: { roles: BaseRoles },
                $pull: { members: { userId: { $in: userIdsToReset } } },
            },
            { upsert: true }
        );

        await clanModel.updateOne(
            { slug: def.slug },
            { $push: { members: { $each: members } } }
        );

        const clan = await clanModel.findOne({ slug: def.slug }).exec();
        if (!clan) throw new Error(`Clan seed: failed to create/find clan: ${def.slug}`);

        const ownerCount = clan.members.filter((m) => m.roleKey === "owner").length;
        if (ownerCount !== 1) {
            for (const m of clan.members) {
                if (String(m.userId) === String(ownerId)) {
                    m.roleKey = "owner";
                } else if (def.memberRange.some((n) => String(getUserId(n)) === String(m.userId))) {
                    if (m.roleKey === "owner") m.roleKey = randomNonOwnerRole();
                }
            }
            await clan.save();
        }

        results.push({
            slug: def.slug,
            owner: `user${def.ownerUserNumber}`,
            members: def.memberRange.length,
        });
    }

    return { clansSeeded: results.length, clans: results };
}
