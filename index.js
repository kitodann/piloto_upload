require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Uploadv2 } = require("./s3Service");
// const uuid = require("uuid").v4;
const app = express();

// upload de unico arquivo
// const upload = multer({ dest: "uploads/" });
// app.post("/upload", upload.single("file"), (req, res) => {
//   res.json({ status: "success" });
// });

// upload de multiplos arquivos
// const upload = multer({ dest: "uploads/" });
// app.post("/upload", upload.array("file"), (req, res) =>
//   res.json({ status: "success" });
// });

// nome de arquivo customizado

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${originalname}`);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.split("/")[0] === "image" ||
    file.mimetype.split("/")[0] === "text" ||
    file.mimetype.split("/")[1] === "pdf"
  ) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000, files: 3 },
});
app.post("/upload", upload.array("file"), async (req, res) => {
  //colocando console.log(req.files); permite ver informações do arquivo no upload por causa do multer
  // console.log(req.files);
  const file = req.files[0];
  const result = await s3Uploadv2(file);
  res.json({ status: "success", result });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "O arquivo é muito grande",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: `Só é permitido o upload de até ${upload.limits.files} arquivos por vez`,
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: `Arquivo deve ser texto, pdf ou imagem`,
      });
    }
  }
});

app.listen(4000, () => console.log("listening on port 4000"));
