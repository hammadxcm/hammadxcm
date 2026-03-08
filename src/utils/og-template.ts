export interface OGData {
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
}

export function buildOGTemplate(data: OGData): Record<string, unknown> {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '1200px',
        height: '630px',
        padding: '80px',
        background: data.bg,
        fontFamily: 'monospace',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '20px',
            },
            children: data.title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: '32px',
              color: data.accent,
              fontFamily: 'monospace',
            },
            children: `> ${data.subtitle}`,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '40px',
              right: '80px',
              fontSize: '24px',
              color: '#666666',
            },
            children: 'hammadkhan.dev',
          },
        },
      ],
    },
  };
}
