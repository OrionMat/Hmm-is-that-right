require("@tensorflow/tfjs");
import * as tf from "@tensorflow/tfjs";
import * as sentenceEncoder from "@tensorflow-models/universal-sentence-encoder";
import { NewsPiece, RelevantNewsPiece } from "src/dataModel/dataModel";

export const extractSimilarText = async (
  statement: string,
  newsPieces: NewsPiece[]
) => {
  const relevantNewsPieces: RelevantNewsPiece[] = [];

  // load model
  const model = await sentenceEncoder.load();

  // calculate statement embedding
  const statementEmbedding = await model.embed(statement);

  for (const newsPiece of newsPieces) {
    let mostSimilarSentence = "";
    let maxSentenceScore = 0;

    let mostSimilarParagraph = "";
    let maxParagraphScore = 0;

    const paragraphs = newsPiece.body;

    // for each paragraph, split into sentences and calculate each sentence's similarity
    for (const paragraph of paragraphs) {
      if (paragraph) {
        let paragraphScore = 0;
        const sentences = paragraph.split(".");

        for (const sentence of sentences) {
          // calculate article sentence embedding
          const sentenceEmbedding = await model.embed(sentence);

          // compute the cosine similarity between the statement and the article sentence
          const scoreTensor = tf.metrics.cosineProximity(
            statementEmbedding,
            sentenceEmbedding
          );
          const score = (await scoreTensor.data())[0];

          // accumulate paragraph score
          paragraphScore += score;

          // compute most similar sentence
          if (score > maxSentenceScore) {
            mostSimilarSentence = sentence;
            maxSentenceScore = score;
          }
        }
        // compute most similar paragraph
        if (paragraphScore > maxParagraphScore) {
          mostSimilarParagraph = paragraph;
          maxParagraphScore = paragraphScore;
        }
      }
    }

    relevantNewsPieces.push({
      url: newsPiece.url,
      title: newsPiece.title,
      date: newsPiece.date,
      source: newsPiece.source,
      mostSimilarSentence: mostSimilarSentence + ".", // adds full stop to end of sentence
      mostSimilarParagraph,
    });
  }
  return relevantNewsPieces;
};
