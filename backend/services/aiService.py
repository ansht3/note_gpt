from transformers import pipeline
import openai
import os
from typing import List, Dict

class AIService:
    def __init__(self):
        self.summarizer = pipeline("summarization")
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
    def generate_summary(self, text: str) -> str:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Generate a concise summary of the following text:"},
                    {"role": "user", "content": text}
                ],
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            raise e

    def generate_flashcards(self, text: str) -> List[Dict[str, str]]:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Create a set of flashcards (question-answer pairs) from the following text:"},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000
            )
            
            # Parse the response into flashcard format
            raw_content = response.choices[0].message.content
            flashcards = self._parse_flashcards(raw_content)
            return flashcards
        except Exception as e:
            print(f"Error generating flashcards: {str(e)}")
            raise e

    def generate_slides(self, text: str, options: Dict) -> List[Dict]:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Create presentation slides from the following text:"},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000
            )
            
            # Parse the response into slides format
            raw_content = response.choices[0].message.content
            slides = self._parse_slides(raw_content)
            return slides
        except Exception as e:
            print(f"Error generating slides: {str(e)}")
            raise e

    def generate_answer(self, question: str, context: str) -> str:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Answer the following question based on the provided context:"},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
                ],
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating answer: {str(e)}")
            raise e

    def _parse_flashcards(self, content: str) -> List[Dict[str, str]]:
        # Implementation to parse AI response into flashcard format
        # This is a simplified version - you might need more robust parsing
        flashcards = []
        lines = content.split('\n')
        current_card = {}
        
        for line in lines:
            if line.startswith('Q:'):
                if current_card:
                    flashcards.append(current_card)
                current_card = {'question': line[2:].strip()}
            elif line.startswith('A:') and current_card:
                current_card['answer'] = line[2:].strip()
        
        if current_card:
            flashcards.append(current_card)
        
        return flashcards

    def _parse_slides(self, content: str) -> List[Dict]:
        # Implementation to parse AI response into slides format
        # This is a simplified version - you might need more robust parsing
        slides = []
        lines = content.split('\n')
        current_slide = {}
        
        for line in lines:
            if line.startswith('Title:'):
                if current_slide:
                    slides.append(current_slide)
                current_slide = {'title': line[6:].strip(), 'content': ''}
            elif current_slide:
                current_slide['content'] += line.strip() + '\n'
        
        if current_slide:
            slides.append(current_slide)
        
        return slides
