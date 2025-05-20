import mongoose from "mongoose";

export async function validateId(
  model: string,
  id: string | mongoose.Types.ObjectId
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const modelData = await mongoose.model(model).findById(id);
    if (!modelData) return false;
    return true;
  } catch (error: any) {
    console.log(error);
    return false;
  }
}
