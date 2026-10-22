export default async function handler(_request, response) {
  response.status(501).json({
    message: 'A função de chat ainda não foi implementada.'
  });
}
