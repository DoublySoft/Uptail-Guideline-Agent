import { PrismaClient, GuidelineStrength } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Check if guidelines already exist
  const existingCount = await prisma.guideline.count();
  if (existingCount > 0) {
    console.log(`✅ Database already contains ${existingCount} guidelines. Skipping seed.`);
  } else {
    // Create initial guidelines
    const guidelines = [
      {
        title: "Precio",
        content: "Si preguntan precio, no dar cifra y proponer reunión",
        strength: GuidelineStrength.hard,
        priority: 10,
        triggers: ["precio", "coste", "cuánto cuesta", "tarifa"],
        active: true,
        singleUse: false
      },
      {
        title: "Tono",
        content: "Usar un tono cercano y positivo",
        strength: GuidelineStrength.soft,
        priority: 7,
        triggers: [],
        active: true,
        singleUse: false
      },
      {
        title: "Contexto del Cliente",
        content: "Siempre preguntar por el contexto del cliente antes de dar recomendaciones",
        strength: GuidelineStrength.hard,
        priority: 9,
        triggers: ["recomendación", "sugerencia", "consejo", "qué me recomiendas"],
        active: true,
        singleUse: false
      },
      {
        title: "Jerga Técnica",
        content: "Evitar usar jerga técnica sin explicar",
        strength: GuidelineStrength.soft,
        priority: 6,
        triggers: ["técnico", "tecnología", "implementación", "API", "backend"],
        active: true,
        singleUse: false
      },
      {
        title: "Confirmar Entendimiento",
        content: "Confirmar entendimiento del cliente antes de proceder",
        strength: GuidelineStrength.hard,
        priority: 8,
        triggers: ["proceder", "continuar", "siguiente", "avanzar"],
        active: true,
        singleUse: false
      },
      {
        title: "Personalización",
        content: "Siempre enfatizar la personalización de la solución",
        strength: GuidelineStrength.soft,
        priority: 7,
        triggers: ["solución", "servicio", "producto", "implementar"],
        active: true,
        singleUse: false
      },
      {
        title: "Seguimiento",
        content: "Proponer seguimiento y soporte continuo",
        strength: GuidelineStrength.soft,
        priority: 6,
        triggers: ["después", "post-venta", "soporte", "mantenimiento"],
        active: true,
        singleUse: false
      },
      {
        title: "Casos de Éxito",
        content: "Mencionar casos de éxito relevantes cuando sea apropiado",
        strength: GuidelineStrength.soft,
        priority: 5,
        triggers: ["ejemplos", "casos", "experiencia", "clientes"],
        active: true,
        singleUse: false
      },
      {
        title: "Urgencia",
        content: "Identificar y responder a señales de urgencia del cliente",
        strength: GuidelineStrength.hard,
        priority: 9,
        triggers: ["urgente", "rápido", "inmediato", "pronto"],
        active: true,
        singleUse: false
      },
      {
        title: "Objeción de Precio",
        content: "Cuando hay objeciones de precio, enfocarse en el valor y ROI",
        strength: GuidelineStrength.hard,
        priority: 8,
        triggers: ["caro", "costoso", "no puedo pagar", "presupuesto"],
        active: true,
        singleUse: false
      }
    ];
    
    for (const guideline of guidelines) {
      await prisma.guideline.create({
        data: guideline
      });
      console.log(`✅ Created guideline: ${guideline.title} - ${guideline.content.substring(0, 50)}...`);
    }
    
    console.log(`🎉 Successfully seeded ${guidelines.length} guidelines!`);
  }

  // Check if sessions already exist
  const existingSessionsCount = await prisma.session.count();
  if (existingSessionsCount > 0) {
    console.log(`✅ Database already contains ${existingSessionsCount} sessions. Skipping session seed.`);
  } else {
    // Create sample sessions with realistic conversation flows
    console.log('📝 Creating realistic chat conversations...');

    // SESSION 1: Consulta de servicios empresariales
    const session1 = await prisma.session.create({
      data: {}
    });
    console.log(`✅ Created session 1: ${session1.id}`);

    // User message 1
    await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'user',
        content: 'Hola, me interesa saber más sobre sus servicios y qué me recomiendan para mi empresa'
      }
    });

    // Assistant response 1
    const message1_2 = await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'assistant',
        content: '¡Hola! Me alegra que te interesen nuestros servicios. Para poder darte la mejor recomendación personalizada, ¿podrías contarme un poco sobre tu empresa, el sector en el que operas y qué tipo de soluciones estás buscando? Esto me ayudará a entender mejor tus necesidades específicas.'
      }
    });

    // User message 2
    await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'user',
        content: 'Somos una empresa de tecnología que desarrolla software para el sector financiero. Tenemos unos 50 empleados y queremos mejorar nuestros procesos internos'
      }
    });

    // Assistant response 2
    const message1_4 = await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'assistant',
        content: 'Perfecto, entiendo tu contexto. El sector financiero tiene requisitos muy específicos de seguridad y cumplimiento. Basándome en tu tamaño de empresa y sector, te recomendaría empezar con una solución de gestión de proyectos que incluya control de versiones y auditoría de cambios. ¿Te parece bien si continuamos explorando esta opción?'
      }
    });

    // User message 3
    await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'user',
        content: 'Sí, suena bien. ¿Cuánto tiempo tomaría la implementación y cuál sería el costo aproximado?'
      }
    });

    // Assistant response 3
    const message1_6 = await prisma.message.create({
      data: {
        sessionId: session1.id,
        role: 'assistant',
        content: 'Para una empresa de tu tamaño, estimamos entre 6-8 semanas para la implementación completa. En cuanto al costo, prefiero no dar cifras aproximadas sin conocer todos los detalles de tu infraestructura actual. Te propongo agendar una reunión técnica donde podamos evaluar tu entorno y darte una propuesta personalizada. ¿Te parece bien programar una llamada para la próxima semana?'
      }
    });

    // Apply guidelines to assistant messages
    const guidelines1_2 = await prisma.guideline.findMany({
      where: { title: { in: ['Contexto del Cliente', 'Personalización', 'Tono'] } }
    });
    for (const guideline of guidelines1_2) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session1.id,
          messageId: message1_2.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines1_4 = await prisma.guideline.findMany({
      where: { title: { in: ['Personalización', 'Casos de Éxito', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines1_4) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session1.id,
          messageId: message1_4.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines1_6 = await prisma.guideline.findMany({
      where: { title: { in: ['Precio', 'Personalización', 'Seguimiento'] } }
    });
    for (const guideline of guidelines1_6) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session1.id,
          messageId: message1_6.id,
          guidelineId: guideline.id
        }
      });
    }

    console.log(`✅ Created session 1 with 6 messages (3 user, 3 assistant)`);

    // SESSION 2: Consulta urgente con presupuesto limitado
    const session2 = await prisma.session.create({
      data: {}
    });
    console.log(`✅ Created session 2: ${session2.id}`);

    // User message 1
    await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'user',
        content: '¿Cuál es el precio de implementación? Necesito algo urgente y tengo un presupuesto limitado'
      }
    });

    // Assistant response 1
    const message2_2 = await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'assistant',
        content: 'Entiendo tu urgencia y tu preocupación por el presupuesto. Para poder darte una propuesta personalizada que se ajuste a tus necesidades y recursos, me gustaría agendar una reunión donde podamos revisar tus requerimientos específicos. Te aseguro que trabajaremos para encontrar la mejor solución dentro de tu presupuesto. ¿Podemos programar una llamada para mañana mismo?'
      }
    });

    // User message 2
    await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'user',
        content: 'No puedo esperar tanto, necesito una respuesta hoy mismo. Mi presupuesto máximo es de 5000€'
      }
    });

    // Assistant response 2
    const message2_4 = await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'assistant',
        content: 'Comprendo perfectamente tu urgencia. Con un presupuesto de 5000€, podemos ofrecerte una solución básica pero funcional que se implemente en 2-3 días. Sin embargo, para darte la mejor opción dentro de tu presupuesto y tiempo, necesito 30 minutos de tu tiempo hoy mismo. ¿Podemos hacer una llamada rápida en la próxima hora?'
      }
    });

    // User message 3
    await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'user',
        content: 'Perfecto, tengo tiempo ahora. ¿Pueden empezar hoy mismo?'
      }
    });

    // Assistant response 3
    const message2_6 = await prisma.message.create({
      data: {
        sessionId: session2.id,
        role: 'assistant',
        content: '¡Excelente! Sí, podemos comenzar hoy mismo. Te voy a transferir con nuestro equipo técnico para que hagamos la evaluación inmediata y empecemos la implementación. Mientras tanto, ¿podrías preparar una lista de tus requisitos más críticos? Esto nos ayudará a optimizar el tiempo y asegurar que la solución se ajuste perfectamente a tu presupuesto de 5000€.'
      }
    });

    // Apply guidelines to assistant messages
    const guidelines2_2 = await prisma.guideline.findMany({
      where: { title: { in: ['Urgencia', 'Objeción de Precio', 'Personalización', 'Seguimiento'] } }
    });
    for (const guideline of guidelines2_2) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session2.id,
          messageId: message2_2.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines2_4 = await prisma.guideline.findMany({
      where: { title: { in: ['Urgencia', 'Objeción de Precio', 'Personalización', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines2_4) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session2.id,
          messageId: message2_4.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines2_6 = await prisma.guideline.findMany({
      where: { title: { in: ['Urgencia', 'Personalización', 'Seguimiento', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines2_6) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session2.id,
          messageId: message2_6.id,
          guidelineId: guideline.id
        }
      });
    }

    console.log(`✅ Created session 2 with 6 messages (3 user, 3 assistant)`);

    // SESSION 3: Consulta técnica especializada
    const session3 = await prisma.session.create({
      data: {}
    });
    console.log(`✅ Created session 3: ${session3.id}`);

    // User message 1
    await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'user',
        content: '¿Pueden implementar una API personalizada? Necesito algo técnico pero que sea fácil de usar'
      }
    });

    // Assistant response 1
    const message3_2 = await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'assistant',
        content: '¡Por supuesto! Podemos desarrollar una API completamente personalizada para ti. Para asegurarme de que la solución sea tanto técnica como fácil de usar, me gustaría entender mejor tu caso de uso específico. ¿Podrías contarme qué tipo de integración necesitas y con qué sistemas? Tenemos experiencia en crear APIs intuitivas que simplifican procesos complejos.'
      }
    });

    // User message 2
    await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'user',
        content: 'Necesito integrar con Salesforce y un sistema de facturación personalizado. ¿Es muy complejo?'
      }
    });

    // Assistant response 2
    const message3_4 = await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'assistant',
        content: 'No es complejo para nosotros, pero entiendo tu preocupación. Hemos implementado más de 50 integraciones con Salesforce y sistemas de facturación. Te explico de manera simple: crearemos un "puente" que conecte ambos sistemas automáticamente. Los datos se sincronizarán en tiempo real sin que tengas que hacer nada manual. ¿Te parece bien si te muestro algunos ejemplos de integraciones similares que hemos hecho?'
      }
    });

    // User message 3
    await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'user',
        content: 'Sí, me gustaría ver ejemplos. ¿Cuánto tiempo tomaría y qué necesito proporcionarles?'
      }
    });

    // Assistant response 3
    const message3_6 = await prisma.message.create({
      data: {
        sessionId: session3.id,
        role: 'assistant',
        content: 'Perfecto. Te voy a enviar algunos casos de éxito relevantes por email. Para la implementación, necesitaríamos acceso a tu instancia de Salesforce (solo lectura) y la documentación de tu sistema de facturación. El desarrollo completo tomaría entre 4-6 semanas. Para darte una propuesta detallada y timeline preciso, ¿podemos agendar una reunión técnica donde revisemos tus sistemas actuales?'
      }
    });

    // Apply guidelines to assistant messages
    const guidelines3_2 = await prisma.guideline.findMany({
      where: { title: { in: ['Jerga Técnica', 'Personalización', 'Contexto del Cliente'] } }
    });
    for (const guideline of guidelines3_2) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session3.id,
          messageId: message3_2.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines3_4 = await prisma.guideline.findMany({
      where: { title: { in: ['Jerga Técnica', 'Casos de Éxito', 'Personalización'] } }
    });
    for (const guideline of guidelines3_4) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session3.id,
          messageId: message3_4.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines3_6 = await prisma.guideline.findMany({
      where: { title: { in: ['Casos de Éxito', 'Personalización', 'Seguimiento', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines3_6) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session3.id,
          messageId: message3_6.id,
          guidelineId: guideline.id
        }
      });
    }

    console.log(`✅ Created session 3 with 6 messages (3 user, 3 assistant)`);

    // SESSION 4: Consulta de soporte post-venta
    const session4 = await prisma.session.create({
      data: {}
    });
    console.log(`✅ Created session 4: ${session4.id}`);

    // User message 1
    await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'user',
        content: 'Hola, ya tenemos implementado el sistema desde hace 3 meses y necesitamos soporte técnico'
      }
    });

    // Assistant response 1
    const message4_2 = await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'assistant',
        content: '¡Hola! Me alegra que ya estén usando nuestro sistema. Para poder ayudarte mejor con el soporte técnico, ¿podrías contarme qué tipo de problema están experimentando? También me gustaría confirmar: ¿están usando la versión más reciente del sistema? Esto me ayudará a darte la solución más efectiva.'
      }
    });

    // User message 2
    await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'user',
        content: 'Tenemos problemas con la sincronización de datos y algunos usuarios no pueden acceder al sistema'
      }
    });

    // Assistant response 2
    const message4_4 = await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'assistant',
        content: 'Entiendo el problema. Los problemas de sincronización y acceso son críticos y los tratamos con prioridad alta. Para resolver esto rápidamente, necesito que me proporciones algunos detalles técnicos: ¿cuántos usuarios están afectados? ¿El problema es intermitente o constante? Mientras tanto, voy a escalar esto a nuestro equipo de soporte técnico para que puedan conectarse remotamente y diagnosticar el problema.'
      }
    });

    // User message 3
    await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'user',
        content: 'Son unos 15 usuarios afectados y el problema es constante desde ayer. ¿Pueden venir hoy mismo?'
      }
    });

    // Assistant response 3
    const message4_6 = await prisma.message.create({
      data: {
        sessionId: session4.id,
        role: 'assistant',
        content: 'Sí, podemos enviar un técnico hoy mismo. Dado que son 15 usuarios afectados y el problema es constante, esto califica como incidente crítico. Voy a programar una visita técnica para esta tarde. Mientras tanto, nuestro equipo remoto ya está trabajando en el diagnóstico. Para minimizar el impacto, ¿podrías proporcionar acceso temporal a un usuario administrativo para que podamos revisar los logs del sistema?'
      }
    });

    // Apply guidelines to assistant messages
    const guidelines4_2 = await prisma.guideline.findMany({
      where: { title: { in: ['Seguimiento', 'Contexto del Cliente', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines4_2) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session4.id,
          messageId: message4_2.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines4_4 = await prisma.guideline.findMany({
      where: { title: { in: ['Urgencia', 'Personalización', 'Seguimiento'] } }
    });
    for (const guideline of guidelines4_4) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session4.id,
          messageId: message4_4.id,
          guidelineId: guideline.id
        }
      });
    }

    const guidelines4_6 = await prisma.guideline.findMany({
      where: { title: { in: ['Urgencia', 'Personalización', 'Seguimiento', 'Confirmar Entendimiento'] } }
    });
    for (const guideline of guidelines4_6) {
      await prisma.guidelineUsage.create({
        data: {
          sessionId: session4.id,
          messageId: message4_6.id,
          guidelineId: guideline.id
        }
      });
    }

    console.log(`✅ Created session 4 with 6 messages (3 user, 3 assistant)`);

    console.log(`🎉 Successfully seeded ${4} sessions with realistic conversations!`);
    console.log(`📊 Total: ${4 * 6} messages (${4 * 3} user, ${4 * 3} assistant)`);
    console.log(`🔗 Multiple guidelines applied to each assistant message`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
