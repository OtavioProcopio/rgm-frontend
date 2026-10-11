import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const conf = readFileSync(resolve(__dirname, '../../../nginx.conf'), 'utf8');

/** Corpo do bloco `location <rota> { ... }`. */
function bloco(rota: string): string {
  const inicio = conf.indexOf(`location ${rota} {`);
  return inicio < 0 ? '' : conf.slice(inicio, conf.indexOf('\n    }', inicio));
}

describe('nginx.conf', () => {
  it('deve repassar os eventos sem acumular quando a rota é a de tempo real', () => {
    // Act
    const eventos = bloco('/api/solicitacoes/events');

    // Assert
    expect(eventos).toContain('proxy_buffering off;');
    expect(eventos).toContain('proxy_cache off;');
    expect(eventos).toContain("proxy_set_header Connection '';");
    expect(eventos).toContain('proxy_http_version 1.1;');
  });

  it('deve manter a conexão de tempo real por 1 hora de leitura quando não há tráfego', () => {
    // Act
    const eventos = bloco('/api/solicitacoes/events');

    // Assert
    expect(eventos).toContain('proxy_read_timeout 1h;');
  });

  it('deve declarar a rota de tempo real antes da rota geral da API quando o arquivo é lido em ordem', () => {
    // Act
    const posicaoEventos = conf.indexOf('location /api/solicitacoes/events {');
    const posicaoApi = conf.indexOf('location /api/ {');

    // Assert
    expect(posicaoEventos).toBeGreaterThan(-1);
    expect(posicaoEventos).toBeLessThan(posicaoApi);
  });

  it('deve manter o proxy das demais chamadas como era quando a rota é a geral da API', () => {
    // Act
    const api = bloco('/api/');

    // Assert
    expect(api).toContain('proxy_read_timeout 60s;');
    expect(api).not.toContain('proxy_buffering');
  });
});
