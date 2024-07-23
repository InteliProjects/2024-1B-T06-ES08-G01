import amqp from 'amqplib';
import { promises as fs } from 'fs';

const logQueue: any[] = [];
let isProcessing = false;

async function adicionarDadosAoJson(novosDados: any) {
  try {
    const dados = await fs.readFile('logs.json', 'utf8');
    let dadosObj;
    try {
      dadosObj = JSON.parse(dados);
    } catch (erro) {
      console.log('Erro ao analisar o arquivo JSON, criando um novo arquivo:', erro);
      dadosObj = [];
    }
    dadosObj.push(novosDados);
    const jsonAtualizado = JSON.stringify(dadosObj, null, 4);

    await fs.writeFile('logs.json', jsonAtualizado, 'utf8');
    console.log('Dados adicionados com sucesso!');
  } catch (erro) {
    console.log('Erro ao acessar ou modificar o arquivo:', erro);
  }
}

function processLogQueue() {
  if (isProcessing || logQueue.length === 0) return;

  isProcessing = true;
  const logMessage = logQueue.shift();

  adicionarDadosAoJson(logMessage).finally(() => {
    isProcessing = false;
    setTimeout(processLogQueue, 1000);
  });
}

async function consumeLogMessages() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'logs';

    await channel.assertQueue(queue, {
      durable: true
    });

    console.log('Waiting for log messages...');

    channel.consume(queue, (message) => {
      if (message !== null) {
        const logMessage = JSON.parse(message.content.toString());
        logQueue.push(logMessage);
        channel.ack(message);
        processLogQueue();
      }
    }, {
      noAck: false
    });
  } catch (error) {
    console.log('Error consuming log messages:', error);
  }
}

consumeLogMessages();
