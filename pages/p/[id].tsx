import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import { PostProps } from "../../src/Post"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';
import Router from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(params?.id) || -1,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    if(!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: post,
    };
  };

  async function publishPost(id: number): Promise<void> {
    await fetch(`/api/publish/${id}`, {
      method: 'PUT',
    });
    await Router.push('/');
  }

const Post: React.FC<PostProps> = (props) => {
  let title = props.title
  if (!props.published) {
    title = `${title} (Draft)`
  }
  
  const postBelongsToUser = 'ggohierroy@hotmail.com' === props.author?.email;

  return (
    <Container>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown children={props.content} />
        {!props.published && postBelongsToUser && (
          <button onClick={() => publishPost(props.id)}>Publish</button>
        )}
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }
        .actions {
          margin-top: 2rem;
        }
        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }
        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Container>
  )
}

export default Post