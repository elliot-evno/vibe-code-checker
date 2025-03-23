import { NextResponse } from 'next/server';
import { Octokit } from "octokit";
import env from "../../env/environment";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN
});

async function getFileContent(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.statusText}`);
  }
  return await response.text();
}

export async function POST(req: Request) {
  try {
    const { owner, repo, path } = await req.json();
    
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    let contents;
    if (Array.isArray(response.data)) {
      contents = await Promise.all(response.data.map(async (item) => {
        const fileContent = item.type === 'file' && item.download_url 
          ? await getFileContent(item.download_url)
          : null;
        
        return {
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          download_url: item.download_url,
          content: fileContent
        };
      }));
    } else {
      const fileContent = response.data.type === 'file' && response.data.download_url
        ? await getFileContent(response.data.download_url)
        : null;
        
      contents = [{
        name: response.data.name,
        path: response.data.path,
        type: response.data.type,
        size: response.data.size,
        content: fileContent,
        download_url: response.data.download_url
      }];
    }

    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 