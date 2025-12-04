import mongoose from "mongoose";

const TokenResetSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usado: { type: Boolean, default: false }
});

export default mongoose.models.TokenReset || mongoose.model("TokenReset", TokenResetSchema);
