import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationResource } from '../src/services/conversationResource.js';

test('PT/EN requests distinguish a game, a rating and proficiency', () => {
  for (const text of ['Quero jogar xadrez com você', 'Vamos jogar uma partida de xadrez?', 'I want to play chess with you', "Let’s play a game of chess", 'Play chess']) assert.equal(conversationResource(text), 'play', text);
  for (const text of ['Qual é o rating do Gustavo no xadrez?', 'What is his chess rating?', 'Estatísticas do Chess.com']) assert.equal(conversationResource(text), 'chess', text);
  for (const text of ['Quais tecnologias ele domina?', 'Qual o nível de habilidade do Gustavo?', 'What technologies does he know?', 'Show his skills']) assert.equal(conversationResource(text), 'skills', text);
});

test('ordinary questions and declined requests do not open resource cards', () => {
  for (const text of ['Olá, quem é você?', 'Você sabe jogar xadrez?', 'Can you play chess?', 'What is React?', 'Não quero jogar xadrez', 'Quais projetos ele tem?']) assert.equal(conversationResource(text), null, text);
});

test('short confirmations only start chess after an offer, and a missing board can be recovered', () => {
  assert.equal(conversationResource('vamos jogar?'), 'offerPlay');
  const offer = { lastAssistant: 'Claro! Você gostaria de jogar uma partida de xadrez comigo?' };
  assert.equal(conversationResource('ss', offer), 'play');
  assert.equal(conversationResource('não', offer), null);
  assert.equal(conversationResource('ss', { lastAssistant: 'Quer ver as estatísticas de xadrez?' }), null);
  assert.equal(conversationResource('kd', { lastAssistant: 'Ótimo! Vamos começar a partida de xadrez.' }), 'play');
  assert.equal(conversationResource('kd', { lastAssistant: 'Vamos jogar!\n[CHESS_GAME]' }), null);
});
