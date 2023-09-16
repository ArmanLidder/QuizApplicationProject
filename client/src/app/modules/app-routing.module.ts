import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordPromptComponent } from '@app/components/password-prompt/password-prompt.component';
import { AuthGuard } from '@app/guard/auth.guard';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GameAdministrationPageComponent } from '@app/pages/game-administration-page/game-administration-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'game-creation', component: GameCreationPageComponent },
    { path: 'quiz-creation', component: QuizCreationPageComponent },
    { path: 'game-admin-prompt', component: PasswordPromptComponent },
    { path: 'game-admin-page', component: GameAdministrationPageComponent, canActivate: [AuthGuard] },
    { path: 'material', component: MaterialPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
