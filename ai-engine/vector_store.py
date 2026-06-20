import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

# We will initialize pinecone lazily to avoid crashing on import if API key is missing
pc = None
index = None

def init_pinecone():
    global pc, index
    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key or api_key == "your_pinecone_api_key_here":
        return False
        
    try:
        if pc is None:
            pc = Pinecone(api_key=api_key)
            index_name = os.environ.get("PINECONE_INDEX_NAME", "resume-index")
            
            # Create index if it doesn't exist
            if index_name not in pc.list_indexes().names():
                pc.create_index(
                    name=index_name,
                    dimension=1024, # Multilingual-e5-large uses 1024
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
            
            index = pc.Index(index_name)
        return True
    except Exception as e:
        print(f"Pinecone init error: {e}")
        return False

def generate_embeddings(texts):
    """
    Use Pinecone Inference API to generate embeddings.
    """
    if not pc:
        if not init_pinecone():
            return []
            
    try:
        embeddings = pc.inference.embed(
            model="multilingual-e5-large",
            inputs=texts,
            parameters={"input_type": "passage", "truncate": "END"}
        )
        return [record['values'] for record in embeddings]
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def store_resume_chunks(resume_id, chunks):
    """
    Store chunks of a resume into Pinecone.
    """
    if not init_pinecone(): return False
    
    embeddings = generate_embeddings(chunks)
    if not embeddings: return False
    
    vectors = []
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            "id": f"{resume_id}_chunk_{i}",
            "values": emb,
            "metadata": {"text": chunk, "resume_id": resume_id}
        })
        
    index.upsert(vectors=vectors)
    return True

def search_similar_chunks(query, top_k=3):
    """
    Search for similar chunks in Pinecone using the query (e.g. JD bullet points).
    """
    if not init_pinecone(): return []
    
    query_emb = generate_embeddings([query])
    if not query_emb: return []
    
    results = index.query(
        vector=query_emb[0],
        top_k=top_k,
        include_metadata=True
    )
    
    return [match['metadata']['text'] for match in results.get('matches', [])]
