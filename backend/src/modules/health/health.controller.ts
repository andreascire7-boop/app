import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'sc-platform-backend', timestamp: new Date().toISOString() };
  }
}
