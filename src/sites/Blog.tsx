import React from 'react';
import { useTranslation } from 'react-i18next';
import blogPosts from '../data/blogPosts.json';

interface BlogPost {
  id: number;
  title: string;
  date: string;
  tags?: string[];
  link?: string;
  content: string;
}

const Blog: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <header style={{
        backgroundColor: '#f5f5f5',
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#4285f4',
          margin: '0',
          fontSize: '24px',
          fontWeight: 'normal'
        }}>{t('blogTitle')}</h1>
      </header>

      <div style={{
        padding: '0 20px'
      }}>
        {blogPosts.map((post: BlogPost) => (
          <article key={post.id} style={{
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h2 style={{
              color: '#4285f4',
              fontSize: '20px',
              marginBottom: '10px',
              fontWeight: 'normal'
            }}>{post.title}</h2>

            <div style={{
              color: '#666',
              fontSize: '14px',
              marginBottom: '15px'
            }}>
              <span style={{ marginRight: '15px' }}>{post.date}</span>
              <span>Labels: {post.tags ? post.tags.join(', ') : 'Blog, Updates'}</span>
            </div>

            <div style={{
              lineHeight: '1.6',
              fontSize: '16px',
              color: '#333'
            }} dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        ))}
      </div>

      <footer style={{
        backgroundColor: '#f5f5f5',
        padding: '15px 20px',
        borderTop: '1px solid #e0e0e0',
        marginTop: '30px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>© {new Date().getFullYear()} {t('blogTitle')}. {t('allRightsReserved')}</p>
        <div style={{ marginTop: '10px' }}>
          <a href="#" style={{ color: '#4285f4', margin: '0 10px' }}>{t('home')}</a>
          <a href="#" style={{ color: '#4285f4', margin: '0 10px' }}>{t('about')}</a>
          <a href="#" style={{ color: '#4285f4', margin: '0 10px' }}>{t('contact')}</a>
        </div>
      </footer>
    </div>
  );
};

export default Blog;