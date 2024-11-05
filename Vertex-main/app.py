import os
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting
from flask import Flask, request, jsonify, send_from_directory

# Configuração do arquivo JSON de credenciais
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"teste-8f37b-fdc71b5ea0bf.json"

app = Flask(__name__)

# Configuração do Vertex AI
vertexai.init(project="teste-8f37b", location="us-central1")
model = GenerativeModel(
    "gemini-1.5-flash-002",
    system_instruction=["Você é um modelo de inteligência artificial da google, você vai fornecer informações para todos os usuários que acessarem o site e realizarem perguntas. Você sempre responde em pt-BR."]
)

# Configurações de geração e segurança
generation_config = {
    "max_output_tokens": 8192,
    "temperature": 1,
    "top_p": 0.95,
}
safety_settings = [
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
    SafetySetting(
        category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=SafetySetting.HarmBlockThreshold.OFF
    ),
]

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    user_question = data.get("question")

    # Verifica se a pergunta do usuário está presente
    if not user_question:
        return jsonify({"response": "Pergunta não fornecida!"}), 400

    responses = model.generate_content(
        [user_question],
        generation_config=generation_config,
        safety_settings=safety_settings,
        stream=True,
    )

    # Concatena todas as respostas em um texto único
    output = ''.join([response.text for response in responses])
    return jsonify({"response": output})

@app.route('/styles/<path:path>')
def send_styles(path):
    return send_from_directory('styles', path)

@app.route('/scripts/<path:path>')
def send_scripts(path):
    return send_from_directory('scripts', path)

if __name__ == '__main__':
    app.run(debug=True)
