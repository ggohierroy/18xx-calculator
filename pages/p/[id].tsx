import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import { PostProps } from "../../src/Post"
import Container from "@mui/material/Container"
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(params?.id) || -1,
      },
      include: {
        author: {
          select: { name: true },
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

const Post: React.FC<PostProps> = (props) => {
  let title = props.title
  if (!props.published) {
    title = `${title} (Draft)`
  }

  return (
    <Container>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown children={props.content} />
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