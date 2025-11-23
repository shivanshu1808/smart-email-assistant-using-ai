package com.email_writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

        private final WebClient webClient;
        private final String apiKey;

       @Value("${gemini.api.url}")
       private String geminiApiUrl;

       @Value("${gemini.api.key}")
       private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder,
                                 @Value("${gemini.api.url}")String baseUrl,
                                 @Value("${gemini.api.key}")String geminiApiKey) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = geminiApiKey;
    }

    public String generateEmailReply(EmailRequest emailRequest){
        //build the prompt
        String prompt = buildPrompt(emailRequest);

        // Prepare raw JSON Body
          String requestBody = String.format("""
                  {
                      "contents": [
                        {
                          "parts": [
                            {
                              "text": "%s"
                            }
                          ]
                        }
                      ]
                    }""",prompt);


        //do request and get response
           String response = webClient.post()
                   .uri(uriBuilder -> uriBuilder
                           .path("/v1beta/models/gemini-2.5-flash:generateContent")
                           .build())
                   .header("x-goog-api-key", apiKey)
                   .header("Content-Type", "application/json")
                   .bodyValue(requestBody)
                   .retrieve()
                   .bodyToMono(String.class)
                   .block();


        // return response
            return extractResponseCOntent(response);


    }

    private String extractResponseCOntent(String response) {

        try{
               ObjectMapper mapper = new ObjectMapper();
               JsonNode rootNode = mapper.readTree(response);
                   return rootNode.path("candidates")
                       .get(0)
                       .path("content")
                       .path("parts")
                       .get(0)
                       .path("text")
                       .asText();
        } catch(Exception e){
            return"Error Processing Request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
           StringBuilder prompt = new StringBuilder();
           prompt.append("Generate a professional email reply for the following email content");
           if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
               prompt.append("use a ").append(emailRequest.getTone()).append(" tone ");
           }
           prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

}
