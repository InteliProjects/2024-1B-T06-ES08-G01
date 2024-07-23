import { Request, Response } from "express";
import axios from "axios"; // axios é usado para fazer requisições HTTP
import FormData from "form-data";
import multer from "multer";
import amqp from "amqplib";

const upload = multer({ storage: multer.memoryStorage() });

async function publishLogMessage(logMessage) {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'logs';

    await channel.assertQueue(queue, {
      durable: true
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(logMessage)), {
      persistent: true
    });

    console.log("Mensagem de log enviada com sucesso para a fila!");
    await channel.close();
    await connection.close();
  } catch (error) {
    console.log("Erro ao enviar mensangem de log:", error);
  }
}

async function retryReq(id, servidor) {
  if (servidor == 1) {
    try {
      const inicio = Date.now();
      const url = process.env.MAIN_SERVER_URL + "/documents/" + id;
      var resposta = await axios.get(url);
      const fileContents = Buffer.from(resposta.data.file_data, "binary");
      const fim = Date.now();
      const duracao = fim - inicio;
      publishLogMessage({
        processamento: "lê arquivo",
        tempo_de_processamento: duracao,
        servidor: 1,
        timestamp: Date.now(),
      });
      return { file_content: fileContents, success: true };
    } catch (error) {
      const errorResponse = error.response || {};
      const errorMessage = errorResponse.data ? errorResponse.data.error : "Erro desconhecido";
      publishLogMessage({
        defeito: errorMessage,
        servidor: 1,
        timestamp: Date.now(),
      });
      return { success: false, error: errorMessage };
    }
  } else if (servidor == 2) {
    try {
      const inicio = Date.now();
      const url = process.env.SOS_SERVER_URL + "/documents/" + id;
      var resposta = await axios.get(url);
      const fileContents = Buffer.from(resposta.data.file_data, "binary");
      const fim = Date.now();
      const duracao = fim - inicio;
      publishLogMessage({
        processamento: "lê arquivo",
        tempo_de_processamento: duracao,
        servidor: 2,
        timestamp: Date.now(),
      });
      return { file_content: fileContents, success: true };
    } catch (error) {
      const errorResponse = error.response || {};
      const errorMessage = errorResponse.data ? errorResponse.data.error : "Erro desconhecido";
      publishLogMessage({
        defeito: errorMessage,
        servidor: 2,
        timestamp: Date.now(),
      });
      return { success: false, error: errorMessage };
    }
  }
}

export const readFile = async (req: Request, res: Response) => {
  let tries = 0;
  let success = false;
  publishLogMessage({
    req: `Requisição para Leitura de Arquivo com id: ${req.params.id}`,
    timestamp: Date.now(),
  });

  try {
    let fileContents;
    while (tries < 3 && success == false) {
      const tentativa = await retryReq(req.params.id, 1);
      if (tentativa.success) {
        fileContents = tentativa.file_content;
        success = true;
      } else {
        tries += 1;
        console.log("Novo retry. Tentativas: " + tries);
      }
    }

    if (success) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="File Title"`);
      res.send(fileContents);
    } else {
      console.log("Não foi possível resolver por retry!!");
      let fileContents;
      tries = 0;
      while (tries < 3 && success == false) {
        const tentativa = await retryReq(req.params.id, 2);
        if (tentativa.success) {
          fileContents = tentativa.file_content;
          success = true;
        } else {
          tries += 1;
          console.log("Novo retry. Tentativas: " + tries);
        }
      }
      if (success) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="File Title"`);
        res.send(fileContents);
      } else {
        console.log("Não foi possível resolver a requisição");
        res.send({ error: "Erros consecutivos no sistema" });
      }
    }
  } catch (error) {
    console.log("Deu erro inesperado!!");
  }
}

export const createFile = async (req, res) => {
  publishLogMessage({
    req: "Requisição para Escrita de arquivo",
    timestamp: Date.now(),
  });
  const inicio = Date.now();
  const url = process.env.MAIN_SERVER_URL + "/documents/upload";

  upload.single("file")(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ error: "Erro ao processar arquivo: " + error.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi carregado." });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    try {
      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      res.send(response.data);
      const fim = Date.now();
      const duracao = fim - inicio;
      publishLogMessage({
        processamento: "cria arquivo",
        tempo_de_processamento: duracao,
        servidor: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      publishLogMessage({
        defeito: error.message,
        timestamp: Date.now(),
      });
      const inicio = Date.now();
      const url = process.env.SOS_SERVER_URL + "/documents/upload";
      const form = new FormData();
      form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
      res.send(response.data);
      const fim = Date.now();
      const duracao = fim - inicio;
      publishLogMessage({
        processamento: "cria arquivo",
        tempo_de_processamento: duracao,
        servidor: 2,
        timestamp: Date.now(),
      });
    }
  });
};
