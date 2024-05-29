import React from 'react';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const queryString = context.req.url.split('?')[1] || '';
  const hashFragment = context.req.url.split('#')[1] || '';
  try {
    // Extract token from the query string
    const urlSearchParams = new URLSearchParams(queryString);
    const token = urlSearchParams.get('token');
    const academy = urlSearchParams.get('academy');

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
      headers['Academy'] = `${academy}`;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/registry/asset/${slug}`, { headers });
    
    if (!res.ok) {
      const errorPayload = await res.json();
      console.log("errorPayload", errorPayload);
      return {
        props: {
          error: errorPayload.detail || errorPayload.error || 'An error occurred',
        },
      };
    }

    const asset = await res.json();

    if (!asset || !asset.assessment || !asset.assessment.slug) {
      return {
        notFound: true,
      };
    }

    // Construct the redirect URL with query string and hash fragment
    let redirectUrl = `/quiz/${asset.assessment.slug}`;
    if (queryString) {
      redirectUrl += `?${queryString}`;
    }
    if (hashFragment) {
      redirectUrl += `#${hashFragment}`;
    }

    // Redirect to the quiz page with query string and hash fragment
    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Error fetching asset data:', error);
    return {
      props: {
        error: 'An error occurred while fetching the data.',
      },
    };
  }
}

const AssetRedirectPage = ({ error }) => {
  if (error) {
    return <div>{error}</div>;
  }
  return null;
};

export default AssetRedirectPage;
