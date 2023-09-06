'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const RecipeModel = require('./models/RecipeModel.js');
// const authorize = require('./auth/authorize.js');
// const OpenAI = require('openai');
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const OPEN_AI_URL = process.env.OPEN_AI_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const axios = require('axios');

const app = express();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });


app.use(cors());
app.use(express.json());
// app.use(authorize);

mongoose.connect(MONGODB_URL);

// // READ
// app.get('/recipes', async (request, response) => {
//   try {
//     let recipes = await RecipeModel.find({});
//     response.json(recipes);
//   } catch (error) {
//     console.log('Something when wrong when finding recipes', error);
//     response.status(500).send(error);
//   }
// })

// CREATE
app.post('/recipes', async (request, response) => {
  try {
    console.log('POST request: ', request.body);
    const { ingredients } = request.body;
    if (!ingredients.length) {
      response.status(400).send('Please send valid food ingredients');
    } else {
      // let recipeRequest = {
      //   model: "gpt-3.5-turbo",
      //   messages: [{
      //     role: "user",
      //     content: `I will give you a list of food ingredients. If one of the ingredients is not a food item, provide a response starting with the text Error. If all ingredients are food items, please provide a food fish that uses these ingredients: ${ingredients}. Provide your response in a json object with the following properties: dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin.`
      //   }]
      // };
      let recipeRequest = {
        prompt: `I will give you a list of food ingredients. If one of the ingredients is not a food item, provide a response starting with the text Error. If all ingredients are food items, please provide a food fish that uses these ingredients: ${ingredients}. Provide your response in a json object with the following properties: dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin.`,
        max_tokens: 50
      };
      let header = { headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": 'application/json',
        }, }
      let openAiRecipeResponse = await axios.post(
        OPEN_AI_URL,
        recipeRequest,
        header
      );
      let openAiRecipe = openAiRecipeResponse.data.choices[0].message.content;
      // const parsedRecipe = JSON.parse(openAiRecipe)
      // let { dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin } = parsedRecipe;
      let {
        dishName,
        ingredients,
        cookingSteps,
        cookingDuration,
        countryOfOrigin,
      } = openAiRecipe;
      let newRecipe = new RecipeModel({ dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin });
      let recipe = await newRecipe.save();
      console.log('New recipe created!: ' + recipe);
      response.json(recipe);
    }
  } catch (error) {
    response.status(400).send(error);
  }
});

// // UPDATE
// app.put('/recipes/:recipeId', async (request, response) => {
//   try {
//     let id = request.params.recipeId;
//     let ingredients = request.body.ingredients;
//     let updatedRecipe = null;
//     if (!id) {
//       response.status(400).send('Please send valid id');
//     } else {
//       let recipeRequest = {
//         "model": "gpt-3.5-turbo",
//         "messages": [{
//           "role": "user",
//           "content": `I will give you a list of food ingredients. If one of the ingredients is not a food item, provide a response starting with the text Error. If all ingredients are food items, please provide a food fish that uses these ingredients: ${ingredients}. Provide your response in a json object with the following properties: dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin.`
//         }]
//       }
//       let openAiRecipeResponse = await axios.get(
//         `${OPEN_AI_URL}`,
//         recipeRequest
//       );
//       let openAiRecipe = openAiRecipeResponse.data.choices[0].message.content;
//       let { dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin } = openAiRecipe;
//       let newRecipe = new RecipeModel({ dishName, ingredients, cookingSteps, cookingDuration, countryOfOrigin });
//       let recipe = await newRecipe.save();
//       console.log('Updated recipe created!: ' + recipe);
//       updatedRecipe = recipe;
//     }
//     await RecipeModel.replaceOne({ _id: id }, updatedRecipe);
//     let newRecipe = await RecipeModel.findOne({ _id: id });
//     response.status(200).json(newRecipe);
//   } catch (error) {
//     response.status(400).send(error);
//   }
// });

// // DELETE
// app.delete('/recipes/:recipeId', async (request, response) => {
//   if (!request.params.recipeId) {
//     request.status(404).send('Please provide a valid recipe ID');
//     return;
//   }
//   try {
//     let recipe = await RecipeModel.findByIdAndDelete(request.params.recipeId);
//     response.status(204).send('Success');
//   } catch (error) {
//     response.status(500).send('Internal Server Error')
//   }
// });

app.listen(PORT, () => console.log(`Listening on ${PORT}`));