from transformers import pipeline
from openai import AsyncOpenAI
import os
from typing import List, Dict, Optional
from datetime import datetime
import logging

class AIService:
    def __init__(self):
        self.summarizer = pipeline("summarization")
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key not found in environment variables")
        self.client = AsyncOpenAI(api_key=self.api_key)
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    async def generate_summary(self, text: str, max_length: int = 500) -> Dict:
        """Generate a summary of the provided text."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Generate a concise summary with key points from the following text:"},
                    {"role": "user", "content": text}
                ],
                max_tokens=max_length,
                temperature=0.7
            )
            return {
                "success": True,
                "summary": response.choices[0].message.content,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating summary: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def generate_flashcards(self, text: str, num_cards: int = 10) -> Dict:
        """Generate flashcards from the provided text."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"Create {num_cards} flashcards (question-answer pairs) from the following text. Format as Q: question A: answer"},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            flashcards = self._parse_flashcards(response.choices[0].message.content)
            return {
                "success": True,
                "flashcards": flashcards,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating flashcards: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def generate_slides(self, text: str, options: Dict) -> Dict:
        """Generate presentation slides from the provided text."""
        try:
            system_prompt = f"""Create presentation slides from the following text.
            Theme: {options.get('theme', 'professional')}
            Slides per topic: {options.get('slidesPerTopic', 2)}
            Format each slide as:
            Title: [slide title]
            Content: [slide content]
            ---"""

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            slides = self._parse_slides(response.choices[0].message.content)
            return {
                "success": True,
                "slides": slides,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating slides: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def generate_answer(self, question: str, context: str) -> Dict:
        """Generate an answer to a question based on the provided context."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Answer the following question based on the provided context. If the answer cannot be found in the context, say so."},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return {
                "success": True,
                "answer": response.choices[0].message.content,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating answer: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    def _parse_flashcards(self, content: str) -> List[Dict[str, str]]:
        """Parse AI response into flashcard format."""
        flashcards = []
        current_card = {}
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('Q:'):
                if current_card.get('question'):
                    flashcards.append(current_card)
                    current_card = {}
                current_card['question'] = line[2:].strip()
            elif line.startswith('A:') and current_card.get('question'):
                current_card['answer'] = line[2:].strip()
                flashcards.append(current_card)
                current_card = {}
        
        if current_card.get('question'):
            flashcards.append(current_card)
        
        return flashcards

    def _parse_slides(self, content: str) -> List[Dict]:
        """Parse AI response into slides format."""
        slides = []
        current_slide = {}
        
        for line in content.split('\n'):
            line = line.strip()
            if not line or line == '---':
                if current_slide.get('title'):
                    slides.append(current_slide)
                    current_slide = {}
                continue
                
            if line.startswith('Title:'):
                if current_slide.get('title'):
                    slides.append(current_slide)
                    current_slide = {}
                current_slide['title'] = line[6:].strip()
                current_slide['content'] = ''
            elif line.startswith('Content:'):
                current_slide['content'] = line[8:].strip()
            elif current_slide.get('content') is not None:
                current_slide['content'] += f"\n{line}"
        
        if current_slide.get('title'):
            slides.append(current_slide)
        
        return slides
