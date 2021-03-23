require("@tensorflow/tfjs");
import * as tf from "@tensorflow/tfjs";
import * as sentenceEncoder from "@tensorflow-models/universal-sentence-encoder";

// computeSentenceSimilarities("The cat sat on the mat", [
//   "The feline sat on the carpet",
//   "The dog ran in the garden. The cat played on the may.",
//   "The fox jumped over the hedge",
//   "The cat rested on the mat",
// ]);

/**
 * Finds the 3 most similar sentences in an article
 * @param querySentence The base sentence
 * @param articleParagraphs Array of paragraphs
 * @returns An array of sentences and an array of sentence scores
 */
export const computeSentenceSimilarities = async (
  querySentence: string,
  articleParagraphs: string[]
) => {
  // load model
  const model = await sentenceEncoder.load();

  // calculate query embedding
  const queryEmbedding = await model.embed(querySentence);
  const articleSentences: string[] = [];
  let sentenceScores: any[] = [];

  // for each paragraph compute the similarity of it's sentences to the query sentence
  for (
    let paraIndex = 0, paraNum = articleParagraphs.length;
    paraIndex < paraNum;
    paraIndex++
  ) {
    const paragraph = articleParagraphs[paraIndex];
    const sentences = paragraph.split(".");

    // for each sentence compute it's embedding and it's cosine similarity to the query sentence
    for (
      let sentIndex = 0, sentNum = sentences.length;
      sentIndex < sentNum;
      sentIndex++
    ) {
      const sentence = sentences[sentIndex];
      if (sentence) {
        const sentenceEmbedding = await model.embed(sentence);

        // compute the cosine similarity between the query and the article sentence
        const scoreTensor = tf.metrics.cosineProximity(
          queryEmbedding,
          sentenceEmbedding
        );

        // push the results into a sentence array and a score array
        articleSentences.push(sentence);
        const score = await scoreTensor.data();
        sentenceScores = sentenceScores.concat(score);
      }
    }

    // repeat, creating two long arrays of scores and sentences for the whole article
    // [y1, y2, y3, y4, y5 ...] (scores)
    // [s1, s2, s3, s4, s5 ...] (sentences)

    // sort the two arrays together
    // (sentences).sort((a, b) => scores[a] - scores[b]);
    // scores.sort()
  }

  console.log(articleSentences);
  console.log(sentenceScores);
  //

  // return the 3 most similar sentences and their paragraph index
  // {sim1: para-1, sim2: para-1, sim3, para-2}
};
