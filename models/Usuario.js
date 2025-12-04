import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// =============================
// HELPERS DE SANITIZAÇÃO
// =============================
function removeDiacritics(str = "") {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/ç/gi, "c");
}

function onlyLettersAndDigits(str = "") {
  return /^[A-Za-z0-9\s]+$/.test(str);
}

function toTitleCaseNoDiacritics(str = "") {
  const s = removeDiacritics(str).toLowerCase().replace(/[^a-z0-9\s]/g, "");
  return s.replace(/\S+/g, (w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w));
}

function sanitizeEstado(str = "") {
  const s = removeDiacritics(str).toUpperCase().replace(/[^A-Z]/g, "");
  return s.slice(0, 2);
}

function extractDigits(str = "") {
  return (str.match(/\d/g) || []).join("");
}

// =============================
// SCHEMA DO USUÁRIO
// =============================
const UsuarioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 80,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Email inválido.",
      },
    },

    senhaHash: {
      type: String,
      required: true,
    },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    endereco: {
      type: String,
      maxlength: 35,
      validate: {
        validator: (v) => (v ? onlyLettersAndDigits(v) : true),
        message: "endereco deve conter apenas letras e números.",
      },
    },

    cidade: {
      type: String,
      maxlength: 20,
      validate: {
        validator: (v) => (v ? onlyLettersAndDigits(v) : true),
        message: "cidade deve conter apenas letras e números.",
      },
    },

    bairro: {
      type: String,
      maxlength: 20,
      validate: {
        validator: (v) => (v ? onlyLettersAndDigits(v) : true),
        message: "bairro deve conter apenas letras e números.",
      },
    },

    estado: {
      type: String,
      minlength: 2,
      maxlength: 2,
      validate: {
        validator: (v) => (v ? /^[A-Z]{2}$/.test(v) : true),
        message: "estado deve conter exatamente 2 letras maiúsculas.",
      },
    },

    cep: {
      type: String,
      validate: {
        validator: (v) => (v ? /^\d{2}\.\d{3}-\d{3}$/.test(v) : true),
        message: "cep deve estar no formato 99.999-999.",
      },
    },
  },
  {
    timestamps: true,
    collection: "usuario",
  }
);

// =============================
// NORMALIZAÇÕES
// =============================
UsuarioSchema.pre("validate", function (next) {
  if (this.endereco) this.endereco = toTitleCaseNoDiacritics(this.endereco).slice(0, 35);
  if (this.cidade) this.cidade = toTitleCaseNoDiacritics(this.cidade).slice(0, 20);
  if (this.bairro) this.bairro = toTitleCaseNoDiacritics(this.bairro).slice(0, 20);

  if (this.estado) this.estado = sanitizeEstado(this.estado);

  if (this.cep) {
    const digits = extractDigits(this.cep).slice(0, 8);
    this.cep = /^\d{8}$/.test(digits)
      ? `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`
      : this.cep;
  }

  next();
});

// =============================
// MÉTODOS DE SENHA
// =============================
UsuarioSchema.methods.setSenha = async function (senhaPlano) {
  if (typeof senhaPlano !== "string" || senhaPlano.length < 1 || senhaPlano.length > 16) {
    throw new Error("senha inválida (1 a 16 caracteres).");
  }

  const salt = await bcrypt.genSalt(10);
  this.senhaHash = await bcrypt.hash(senhaPlano, salt);
};

UsuarioSchema.methods.compareSenha = function (senhaPlano) {
  return bcrypt.compare(senhaPlano, this.senhaHash);
};

export default mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);
