import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Iaservice } from './iaservice';
import { ConsultaIa } from './model/ConsultaIa';

interface MensajeChat {
  rol: 'bot' | 'user';
  texto: string;
}

@Component({
  selector: 'app-asesor-ia',
  imports: [CommonModule, FormsModule],
  templateUrl: './asesor-ia.html',
  styleUrl: './asesor-ia.css',
})
export class AsesorIa {

  mensajes: MensajeChat[] = [
    { rol: 'bot', texto: 'Hola. Dime qué necesitas hacer y te sugeriré productos del inventario, cantidades aproximadas y cuidados importantes.' }
  ];

  pregunta: string = '';
  enviando: boolean = false;

  consultas: ConsultaIa[] = [];
  historialPersistente: boolean = false;

  sugerencias = [
    { texto: 'Pintar una pared', prompt: 'Necesito pintar una pared interior de 20 m2' },
    { texto: 'Instalar ducha', prompt: '¿Qué necesito para instalar una ducha eléctrica?' },
    { texto: 'Perforar concreto', prompt: 'Busco herramientas para perforar concreto' },
  ];

  constructor(private iaservice: Iaservice, private cdr: ChangeDetectorRef) {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.iaservice.historial().subscribe(respuesta => {
      this.consultas = respuesta.consultas;
      this.historialPersistente = respuesta.historialPersistente;
      this.cdr.detectChanges();
    });
  }

  usarSugerencia(prompt: string) {
    this.pregunta = prompt;
  }

  enviar() {
    if (!this.pregunta.trim() || this.enviando) return;

    const preguntaEnviada = this.pregunta.trim();
    this.mensajes.push({ rol: 'user', texto: preguntaEnviada });
    this.pregunta = '';
    this.enviando = true;
    this.cdr.detectChanges();

    this.iaservice.preguntar(preguntaEnviada).subscribe({
      next: (respuesta) => {
        this.mensajes.push({ rol: 'bot', texto: respuesta.respuesta });
        this.enviando = false;
        this.cargarHistorial();
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajes.push({ rol: 'bot', texto: 'Ocurrió un error al procesar tu consulta. Intenta de nuevo.' });
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
