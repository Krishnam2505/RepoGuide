import asyncio
from services.rag_service import generate_answer
from config import settings

async def test():
    try:
        # Assuming we ingested 'jonschlinkert_is-number' earlier
        ans = await generate_answer("jonschlinkert_is-number", "What does this repo do?")
        print("ANSWER:", ans)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
