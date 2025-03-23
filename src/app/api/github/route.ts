import { NextResponse } from 'next/server';
import { Octokit } from "octokit";
import env from "../../../env/environment";

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN
});

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
      contents = response.data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        download_url: item.download_url
      }));
    } else {
      contents = [{
        name: response.data.name,
        path: response.data.path,
        type: response.data.type,
        size: response.data.size,
        content: response.data.type === 'file' ? response.data.content : null,
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