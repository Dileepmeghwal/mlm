import moment from "moment";
import PlanPin from "../planPin/planPin.model";

export class AdminService {
  static async getTotalAmount() {
    const [amount] = await PlanPin.aggregate([
      {
        $lookup: {
          from: "plans",
          localField: "plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: "$plan" },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$plan.enrollAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ]);

    console.log(amount, "amount");
    return amount;
  }

  static async ReferralCode() {
    const [result] = await PlanPin.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          used: { $sum: { $cond: [{ $eq: ["$used", true] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          used: 1,
          unused: { $subtract: ["$total", "$used"] },
        },
      },
    ]);
    console.log(result, "result of referral code count");
    return result;
  }

  static async getUserRegistration(startDate: Date, endDate: Date) {
    console.log(startDate, endDate, "startDate, endDate");
    const result = await PlanPin.aggregate([
      {
        $match: {
          createdAt: {
            $gte: moment(startDate).startOf("day").toDate(),
            $lte: moment(endDate).endOf("day").toDate(),
          },
          used: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "usedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "plans",
          localField: "plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: "$plan" },
      {
        $lookup: {
          from: "users",
          localField: "createdFrom",
          foreignField: "_id",
          as: "createdFrom",
        },
      },
      { $unwind: "$createdFrom" },
      {
        $group: {
          _id: "$_id",
          total: { $sum: 1 },
          user: { $first: "$user" },
          plan: { $first: "$plan" },
          createdFrom: { $first: "$createdFrom" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          _id: 0,
          total: 1,
          user: {
            first_name: "$user.first_name",
            last_name: "$user.last_name",
            email: "$user.email",
            userId: "$user.userId",
          },
          plan: {
            name: "$plan.name",
            enrollAmount: "$plan.enrollAmount",
          },
          createdFrom: {
            first_name: "$createdFrom.first_name",
            last_name: "$createdFrom.last_name",
            email: "$createdFrom.email",
            userId: "$createdFrom.userId",
          },
          updatedAt: 1,
        },
      },
    ]);
    console.log(result, "result of user registration");
    return result;
  }
}
