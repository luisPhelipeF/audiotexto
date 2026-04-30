export async function createGoogleDoc(accessToken: string, title: string, content: string): Promise<string> {
  try {
    // 1. Procurar ou criar a pasta "Audiotexto" no Google Drive
    const folderId = await findOrCreateFolder(accessToken, 'Audiotexto');

    // 2. Criar um documento vazio no Google Docs
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Falha ao criar o documento no Docs: ${errText}`);
    }
    const docData = await createRes.json();
    const documentId = docData.documentId;

    // 3. Inserir o texto no documento recém-criado
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index: 1, // Começa a inserir a partir do início do documento
              },
              text: content,
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Falha ao inserir texto: ${errText}`);
    }

    // 4. Mover o documento para a pasta "Audiotexto"
    await moveFileToFolder(accessToken, documentId, folderId);

    return `https://docs.google.com/document/d/${documentId}/edit`;
  } catch (error) {
    console.error('Erro no Google Docs/Drive:', error);
    throw error;
  }
}

async function findOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  // A. Buscar a pasta
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Falha ao buscar pastas no Google Drive: ${errText}`);
  }
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    // Pasta encontrada
    return searchData.files[0].id;
  }

  // B. Criar a pasta se não existir
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Falha ao criar a pasta no Google Drive: ${errText}`);
  }
  const createData = await createRes.json();
  return createData.id;
}

async function moveFileToFolder(accessToken: string, fileId: string, folderId: string): Promise<void> {
  // A API do Drive v3 precisa pegar os pais atuais para removê-los
  const getRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!getRes.ok) {
    const errText = await getRes.text();
    throw new Error(`Falha ao obter dados do arquivo para mover: ${errText}`);
  }
  const fileData = await getRes.json();
  const previousParents = fileData.parents ? fileData.parents.join(',') : '';

  // Mover o arquivo para a nova pasta e remover da raiz
  const moveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!moveRes.ok) {
    const errText = await moveRes.text();
    throw new Error(`Falha ao mover o arquivo para a pasta Audiotexto: ${errText}`);
  }
}
