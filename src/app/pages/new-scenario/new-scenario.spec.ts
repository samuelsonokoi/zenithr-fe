import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewScenario } from './new-scenario';

describe('NewScenario', () => {
  let component: NewScenario;
  let fixture: ComponentFixture<NewScenario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewScenario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewScenario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
