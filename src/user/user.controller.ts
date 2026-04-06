import { Request, Response } from "express";
import User from "./user.model";
import { PlanPinService } from "../planPin/planPin.service";
import { generateToken } from "../middleware/jwt";
import { UserPlanService } from "../planUser/userPlan.service";
import { PlanLevelUserService } from "../planLevelUser/planLevelUser.service";
import { referFlowService } from "../referredFlow/referrefFlow.service";
import * as bcrypt from "bcrypt";
import { WithdrawService } from "../withdraw/withdraw.service";
import { NotificationService } from "../notification/notification.service";

const ReferFlow = new referFlowService();

export const signupController = async (req: any, res: any) => {
  const body = req.body;
  if (!body.email || !body.password || !body.first_name || !body.last_name) {
    return res.status(400).send({
      message: "Please fill all the required fields",
    });
  }
  let emailRegex = /\S+@\S+\.\S+/;
  let validEmail = emailRegex.test(body.email);
  if (!validEmail) return res.status(404).json({ message: "Invalid email" });
  const password = bcrypt.hashSync(body.password, 10);
  const user = new User({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    password: password,
    mobile_number: body.mobile_number,
    dob: body.dob,
  });
  return user
    .save()
    .then((data) => {
      const token = generateToken({
        email: data.email,
        _id: data._id,
        referredBy: null,
        verified: false,
        type: "USER",
      });
      res.json({ message: "User created", user: data, token });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user.",
      });
    });
};

export async function VerifyPin(req: Request, res: Response): Promise<any> {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ message: "Pin is required" });

  const pinData = await PlanPinService.getPlanPinByPin(pin);
  if (!pinData || pinData.used)
    return res.status(400).json({ message: "Invalid Pin or Pin already used" });
  const user = await User.findById(req.user._id).select("-password");
  if (!user || user.isVerified) {
    return res
      .status(404)
      .json({ message: "User not found or already verified" });
  }
  user.pin = pinData._id;
  pinData.used = true;
  pinData.usedBy = user._id;
  user.referred_by = pinData.createdFrom;
  user.isVerified = true;
  await user.save();
  await pinData.save();
  await UserPlanService.create({
    user: user._id,
    plan: pinData.plan,
    pin: pinData._id,
    referredBy: pinData.createdFrom,
  });

  const token = generateToken({
    email: user.email,
    _id: user._id,
    referredBy: user.referred_by,
    verified: true,
    type: "USER",
  });

  await PlanLevelUserService.createByPlan({
    plan: pinData.plan,
    user: user._id,
  }).catch((e) => {
    console.log(e);
    res.json({
      message: "pin verified but plan does not have any levels",
      user,
      token,
    });
  });
  await ReferFlow.handleReferFlow(user._id, pinData.plan);
  return res.json({ message: "Pin verified successfully", user, token });
}

export async function loginController(req: any, res: any) {
  try {
    const body = req.body;
    if (!body.email || !body.password) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }

    // Find user by email
    const data = await User.findOne({ email: body.email }).lean();

    if (!data) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const passwordIsValid = bcrypt.compareSync(body.password, data.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password",
      });
    }

    if (data.isBlock) {
      return res.status(401).send({
        message: "User is blocked",
      });
    }

    const token = generateToken({
      email: data.email,
      _id: data._id,
      referredBy: data.referred_by,
      verified: data.isVerified,
      type: data.type || "USER",
    });

    res.send({ user: data, token, message: "User logged in successfully" });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).send({
      message: err.message || "Some error occurred while login",
    });
  }
}

export async function getUserById(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const user = await User.find({ userId: id }).select("-password");
    if (!user.length)
      return res.status(404).json({ message: "User not found" });
    return res.json(user[0]);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Some error occurred while getting the user",
    });
  }
}
export async function getById(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Id is required" });
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Some error occurred while getting the user",
    });
  }
}
export async function verifyToken(req: Request, res: Response): Promise<any> {
  const user = await User.findById(req.user._id).select("-password");
  if (user?.isBlock)
    return res.status(401).json({ message: "User is blocked" });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
}

export async function getUserLevelLogs(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const level: any = req.query.level;
    const user = req.user._id;
    if (!level) return res.status(400).json({ message: "Level is required" });
    const logs = await ReferFlow.getUserLevelReferLogs(user, level);
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Some error occurred while getting the user",
    });
  }
}

export async function getUserList(req: Request, res: Response): Promise<any> {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const users = await User.find()
      .skip(skip)
      .limit(limitNumber)
      .select("-password")
      .sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;
    const nextPage = hasNextPage ? pageNumber + 1 : null;
    const previousPage = hasPreviousPage ? pageNumber - 1 : null;
    const pagination = {
      totalUsers,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage,
      previousPage,
    };
    res.set("Access-Control-Expose-Headers", "X-Pagination");
    res.set("X-Pagination", JSON.stringify(pagination));

    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message || "Some error occurred while getting the user",
    });
  }
}

export async function blockUnblock(req: Request, res: Response): Promise<any> {
  const body = req.body;
  if (!body.userId)
    return res.status(400).json({ message: "User Id is required" });
  const user = await User.findOne({ userId: body.userId });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isBlock = body.isBlock;
  await user.save();
  return res.json({ message: "User blocked successfully" });
}

export async function updateUser(req: Request, res: Response): Promise<any> {
  const userId = req.user?._id;
  const body = req.body;
  if (!userId) return res.status(400).json({ message: "User Id is required" });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  Object.assign(user, body);
  await user.save();
  return res.json({ message: "User updated successfully" });
}

export async function getProfile(req: Request, res: Response): Promise<any> {
  try {
    const userId = req.user?._id;
    const userData = await User.findById(userId).select("-password");
    return res.json(userData);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "something went wrong while fetching user profile" });
  }
}

interface EditUserProfile {
  first_name: string;
  last_name: string;
  mobile_number: string;
  dob: Date;
  adress1: string;
  adress2: string;
}
export async function updateUserProfile(
  req: Request,
  res: Response
): Promise<any> {
  const body: EditUserProfile = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.first_name = body.first_name;
  user.last_name = body.last_name;
  user.mobile_number = body.mobile_number;
  user.dob = body.dob;
  user.adress1 = body.adress1;
  user.adress2 = body.adress2;
  await user.save();
  return res.json({ message: "User updated successfully" });
}

interface EditFinantialDetails {
  pan: string;
  adhaar: string;
  upi: string;
  bankAC: string;
  ifsc: string;
  bankName: string;
}

export async function updateFinantialDetails(
  req: Request,
  res: Response
): Promise<any> {
  const body: EditFinantialDetails = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.bankAC?.length <= 10 || user.upi?.length <= 10)
    return res.status(404).json({
      message: "you can not change account details, please contact admin.",
    });
  user.pan = body.pan;
  user.adhaar = body.adhaar;
  user.upi = body.upi;
  user.bankAC = body.bankAC;
  user.ifsc = body.ifsc;
  user.bankName = body.bankName;
  await user.save();
  return res.json({ message: "User updated successfully" });
}

export async function updateUserByAdmin(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const body = req.body;
    const userId = body.userId;
    if (!userId)
      return res.status(400).json({ message: "User Id is required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    delete body.userId;
    Object.assign(user, body);
    await user.save();
    return res.json({ message: "User updated successfully" });
  } catch (err: any) {
    res.status(500).json({
      message: err.message || "Some error occurred while getting the user",
    });
  }
}

export async function calculateUserWithdraws(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const userId = req.query.userId as string;
    const amount = req.query.amount as string;
    if (!userId)
      return res.status(400).json({ message: "User Id is required" });
    if (!amount) return res.status(400).json({ message: "Amount is required" });
    const withdraws = await WithdrawService.calculateWithDraws(userId, amount);
    return res.json(withdraws);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error calculating user withdraws: " + error.message });
  }
}
interface WithdrawAmount {
  userId: string;
  amount: number;
}

export async function withdrawAmount(
  req: Request,
  res: Response
): Promise<any> {
  const body: WithdrawAmount = req.body;
  try {
    const withdraws = await WithdrawService.calculateWithDraws(
      body.userId,
      body.amount.toString()
    );
    const user = await User.findById(body.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.wallet < withdraws.total)
      return res.status(400).json({ message: "Insufficient balance" });
    await WithdrawService.createWithdraw({
      user: body.userId,
      totalAmount: withdraws.total,
      taxDeduction: withdraws.deduction,
      withdrawAmount: withdraws.withdrawAmount,
      percentage: withdraws.percentage,
    });
    user.wallet -= withdraws.total;
    await user.save();
    await NotificationService.create({
      user: body.userId,
      message: `You have successfully withdrawn ${withdraws.total} from your account`,
      type: "DEBIT",
    });

    return res.json({ message: "Withdraw created successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error withdrawing amount: " + err.message });
  }
}
export async function withdrawAmountCostumer(
  req: Request,
  res: Response
): Promise<any> {
  const body: WithdrawAmount = req.body;
  const userId = req.user._id;
  try {
    const withdraws = await WithdrawService.calculateWithDraws(
      userId,
      body.amount.toString()
    );
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if(!user.bankAC?.length || user.bankAC?.length <= 10  || !user.upi?.length ){
      return res.status(404).json({
        message: "please fill bank details before withdrawing.",
      });
    }
    if (user.wallet < withdraws.total)
      return res.status(400).json({ message: "Insufficient balance" });
    await WithdrawService.createWithdraw({
      user: userId,
      totalAmount: withdraws.total,
      taxDeduction: withdraws.deduction,
      withdrawAmount: withdraws.withdrawAmount,
      percentage: withdraws.percentage,
    });
    user.wallet -= withdraws.total;
    await user.save();
    await NotificationService.create({
      user: body.userId,
      message: `You have successfully added a withdrawal of ₹${withdraws.total}. Admin will approve it soon`,
      type: "DEBIT",
    });

    return res.json({ message: "Withdraw created successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error withdrawing amount: " + err.message });
  }
}

export async function getUserTransactions(
  req: Request,
  res: Response
): Promise<any> {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: "Id is required" });
  try {
    const transactions = await WithdrawService.getUserWithdraws(id);

    return res.json(transactions);
  } catch (error: any) {
    res.status(500).json({
      message: "Error retrieving user transactions: " + error.message,
    });
  }
}
